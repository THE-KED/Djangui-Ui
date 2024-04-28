import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";
import {DataService} from "../../Services/data.service";
import {Membre} from "../../../Models/Entitys/Membre";
import {MembreServiceService} from "../../Services/membre-service.service";
import {MatTableDataSource} from "@angular/material/table";
import {AuthService} from "../../Services/auth.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  // standalone: true,
  // imports: [MatTableModule, NgFor, MatButtonModule, NgIf, MatIconModule],
})

export class MemberListComponent implements OnInit{

  destroyRef = inject(DestroyRef);
  mem:MatTableDataSource<Membre> = new MatTableDataSource<Membre>();
  constructor(private memberService :MembreServiceService,
              public authService:AuthService, private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.memberService.LoadMembres().pipe(
        takeUntilDestroyed(this.destroyRef)
    ).subscribe(
      data=>{
        let table:Membre[]=[];
        for (let el of data){
          if (el.nom!=="ADMIN"&&el.profession!=="Admin")
            table.push(el);
        }
        this.mem = new MatTableDataSource(table);
        this.cd.markForCheck();
      }
    );
  }


  columnsToDisplay = ['No', 'Nom', 'Poste'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement = this.mem.data[1];

  reset(element:Membre) {
    this.authService.reset(element).subscribe(data=>{});
  }
}
