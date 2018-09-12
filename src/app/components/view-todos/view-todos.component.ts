import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { TodoService } from '../../shared/services/todo.service';
import { TodoInterface } from '../../shared/interfaces/todo-interface';
//Importation des composant matérial
import {MatTableDataSource, MatSort, MatSelect, MatOption} from '@angular/material';
import { TodoHelper } from './../../shared/helpers/todo-helper';
import { MatColumns} from './../../shared/interfaces/mat-columns';

@Component({
  selector: 'view-todos',
  templateUrl: './view-todos.component.html',
  styleUrls: ['./view-todos.component.scss']
})
export class ViewTodosComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  /**
   * Abonnement à un todo qui vient de l'espace (meuh non ...., de todoService)
   */
  private todoSubscription: Subscription;

  public todos: TodoInterface[];
  /**
   * gère le status 
   */
  public checkedStatus: boolean = false;

  /**
   * Source des données pour le tableau Material
   */
  public dataSource = new MatTableDataSource<TodoInterface>();

  /**
   * Colonnes utilisées dans mat-table
   */
  public columns =new FormControl(); //binding vers la liste
 

 
/**
 * Options réellement sélectionnées par l'utilisateur 
 */
  public selectedOption: any;

  /**
   * Instance de la Classe TodoHelper
   */
  public helper: TodoHelper;

 public selectedValue : String []; 

  /**
   * Tableau de todo à afficher 
   */

  constructor(private todoService: TodoService) {
    this.todos = []; // Définit le tableau des todo à afficher

    //Instancie le helper
    this.helper = new TodoHelper();
    this.selectedValue = this.helper.optionalColumnsToArray();

    this.todoSubscription = this.todoService.getTodo().subscribe((todo) => {
      console.log('observable todo' + JSON.stringify(todo));
      //Ajoute le todo à la liste des todo sauf si il existe deja 
      //Attention s'il existe je doit remplacer par les nouvelles valeurs
      const index = this.todos.findIndex((obj) => obj.id == todo.id);
      if (index ===-1 && todo.hasOwnProperty('id')) {
        this.todos.push(todo);
      }else{
        this.todos[index] = todo;
      }
      this.dataSource.data = this.todos;
    });

  }
  /**
   * Après construction de l'objet on charge la liste des todos existant dans la base
   */
  ngOnInit() {
    //Récupère les todos existants dans la base
    this.todoService.getTodos().subscribe((todos) => {
      this.todos = todos;
      console.log('Il y a ' + this.todos.length + 'todos à afficher');
      // On défini à ce moment la la source de donées
      this.dataSource.data = this.todos;
      this.dataSource.sort = this.sort;


    });
  }

  /**
   * supprime un todo de la liste
   */
  public delete(todo:TodoInterface): void {
    const index = this.todos.indexOf(todo);
    const _todo = this.todos[index];// récupère le todo
    this.todos.splice(index, 1); // dépile l'élément du tableau )
    this.dataSource.data = this.todos;
    this.todoService.deleteTodo(_todo); // appel du service 
  }

  public checkUncheckAll() {
    this.checkedStatus = !this.checkedStatus;
    //appel la methode prive check
    this._check();
  }
  /**
    * Détermine si oui ou non une boite est cochée
    */
  public noneChecked(): Boolean {
    let status: Boolean = true;
    for (const todo of this.todos) {
      if (todo.isChecked) {
        status = false;
      }
    }
    return status;
  }

  /**
   * Bascule l'état de isChecked d'un todo
   * @param index Indice de l'élément dans le tableau 
   */
  public toggle(index: number): void {
    this.todos[index].isChecked = !this.todos[index].isChecked
    this.checkedStatus = this._allChecked();

  }
  private _allChecked(): boolean {
    let allChecked: boolean = true;

    for (const todo of this.todos) {
      if (todo.isChecked) {
        allChecked = false;
      }
    }
    return allChecked;
  }
  /**
 * Change l'état de tous les todos
 */
  private _check(): void {
    for (let index = 0; index < this.todos.length; index++)
      this.todos[index].isChecked = this.checkedStatus;
  }
  /**
     * Determine l'état d'un todo checked or not 
     * @param TodoInterface todo le todo à tester
     */
  public isChecked(todo: TodoInterface): Boolean {
    return todo.isChecked;
  }

  /**
  * Supprimer les Todos cochés
   */
  public deleteChecked() {
    const _todos: TodoInterface[] = [];

    for (const todo of this.todos) {
      if (!todo.isChecked) {
        _todos.push(todo);
      } else {
        this.todoService.deleteTodo(todo)
      }
    }
    this.todos = _todos;
  }

  /**
   * Transmets le todo à modifier au formulaire
   * @param todo : TodoInterface todo à modifier
   */
  public update(todo: TodoInterface): void {
    console.log('modification du todo : ' + todo.id);
    this.todoService.sendTodo(todo);
  }

  /**
   * Detecte un changement de sélection de colonne 
   * @param event Evénement propagé
   */
  public changeView(event:any): void{
    this.helper.setDisplayedColumns(this.selectedOption);
 
  
  }

}
